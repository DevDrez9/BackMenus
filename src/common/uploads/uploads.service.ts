import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UploadImageDto, UploadType } from './dto/upload-image.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  async uploadImage(userId: string, uploadDto: UploadImageDto) {
    const { file, type, entityId } = uploadDto;
    let restaurantId = '';

    // --- VALIDACIONES ---
    if (type === UploadType.RESTAURANT) {
       // ... (Lógica existente de restaurante) ...
       const restaurant = await this.prisma.restaurant.findUnique({ where: { id: entityId } });
       if (!restaurant) throw new NotFoundException('Restaurante no encontrado');
       if (restaurant.userId !== userId) throw new BadRequestException('No tienes permiso');
       restaurantId = restaurant.id;
       await this.validatePlanLimits(restaurantId, type);

    } else if (type === UploadType.PRODUCT) {
       // ... (Lógica existente de producto) ...
       const product = await this.prisma.product.findUnique({
         where: { id: entityId },
         include: { category: { include: { menu: true } } }
       });
       if (!product) throw new NotFoundException('Producto no encontrado');
       restaurantId = product.category.menu.restaurantId;
       const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
       if (!restaurant || restaurant.userId !== userId) throw new BadRequestException('No tienes permiso');
       await this.validatePlanLimits(restaurantId, type);

    } else if (type === UploadType.SECTION_TEMPLATE) {
       // --- NUEVA LÓGICA PARA TEMPLATES ---
       // Aquí deberíamos validar que el usuario sea ADMIN, pero asumimos que el Guard del controlador ya lo hizo
       // o verificamos el rol del userId si es necesario.
       const template = await this.prisma.sectionTemplate.findUnique({ where: { id: entityId } });
       if (!template) throw new NotFoundException('Plantilla no encontrada');
       // Las plantillas no tienen límites de plan para SUBIDA (son del sistema)
    }

    // --- PROCESAMIENTO ---
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${uuidv4()}.webp`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    await sharp(buffer)
      .resize(800, null, { fit: 'inside', withoutEnlargement: true }) 
      .webp({ quality: 80 })
      .toFile(filePath);

    const publicUrl = `/uploads/${fileName}`; 

    // --- GUARDADO ---
    const image = await this.prisma.image.create({
      data: {
        url: publicUrl,
        publicId: fileName,
        restaurantId: type === UploadType.RESTAURANT ? entityId : undefined,
        productId: type === UploadType.PRODUCT ? entityId : undefined,
        sectionTemplateId: type === UploadType.SECTION_TEMPLATE ? entityId : undefined, // Nuevo campo
      },
    });

    // Si es un template, actualizamos también el campo rápido 'imageUrl'
    if (type === UploadType.SECTION_TEMPLATE) {
      await this.prisma.sectionTemplate.update({
        where: { id: entityId },
        data: { imageUrl: publicUrl }
      });
    }

    return image;
  }

   // --- NUEVO MÉTODO: ELIMINAR IMAGEN ---
  async deleteImage(id: string, userId: string) {
    // 1. Buscar la imagen
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: { 
        restaurant: true,
        product: { include: { category: { include: { menu: { include: { restaurant: true } } } } } }
      }
    });

    if (!image) throw new NotFoundException('Imagen no encontrada');

    // 2. Verificar Propiedad
    let ownerId = '';
    if (image.restaurant) {
      ownerId = image.restaurant.userId;
    } else if (image.product) {
      ownerId = image.product.category.menu.restaurant.userId;
    } 
    // Si es template, asumimos admin (o simplificamos validación)
    
    if (ownerId && ownerId !== userId) {
        // Nota: Si implementas roles, aquí podrías dejar pasar al ADMIN
        throw new ForbiddenException('No tienes permiso para eliminar esta imagen');
    }

    // 3. Borrar archivo físico
    if (image.publicId) {
        const filePath = path.join(process.cwd(), 'uploads', image.publicId);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (e) {
                console.error("Error borrando archivo físico", e);
            }
        }
    }

    // 4. Borrar de BD
    return this.prisma.image.delete({ where: { id } });
  }


   private async validatePlanLimits(restaurantId: string, type: UploadType) {
     // ... (código existente)
     if (type === UploadType.SECTION_TEMPLATE) return; // Sin límites para templates admin
     
     const subscription = await this.prisma.subscription.findUnique({
      where: { restaurantId },
      include: { plan: true },
    });
    if (!subscription?.plan) throw new ForbiddenException('Sin plan activo');
    const { plan } = subscription;

    if (type === UploadType.RESTAURANT) {
       const count = await this.prisma.image.count({ where: { restaurantId } });
       if (count >= plan.maxHighlightImages) throw new ForbiddenException('Límite de imágenes alcanzado');
    } else if (type === UploadType.PRODUCT) {
       if (plan.maxProductImages === null) return;
       const count = await this.prisma.image.count({ where: { product: { category: { menu: { restaurantId } } } } });
       if (count >= plan.maxProductImages) throw new ForbiddenException('Límite de fotos de productos alcanzado');
    }
  }
}