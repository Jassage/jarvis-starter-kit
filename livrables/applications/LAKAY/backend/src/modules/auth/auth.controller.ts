import { Request, Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';
import { uploadToCloudinary } from '../../config/cloudinary';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Inscription d'un nouvel utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [AGENCY, OWNER, INDIVIDUAL] }
 *     responses:
 *       201: { description: Compte créé avec succès }
 *       409: { description: Email déjà utilisé }
 */
export async function register(req: Request, res: Response) {
  const user = await authService.register(req.body);
  sendSuccess(res, { user }, 'Compte créé. Vérifiez votre email pour activer votre compte.', 201);
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion
 */
export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body.email, req.body.password);
  sendSuccess(res, result, 'Connexion réussie');
}

export async function refresh(req: Request, res: Response) {
  const result = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, result, 'Tokens renouvelés');
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.body.refreshToken);
  sendSuccess(res, null, 'Déconnexion réussie');
}

export async function forgotPassword(req: Request, res: Response) {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, null, 'Si cet email existe, vous recevrez un lien de réinitialisation.');
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body.token, req.body.password);
  sendSuccess(res, null, 'Mot de passe réinitialisé avec succès.');
}

export async function verifyEmail(req: Request, res: Response) {
  await authService.verifyEmail(req.params.token);
  sendSuccess(res, null, 'Email vérifié avec succès.');
}

export async function getMe(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);
  sendSuccess(res, { user });
}

export async function updateProfile(req: Request, res: Response) {
  const user = await authService.updateProfile(req.user!.id, req.body);
  sendSuccess(res, { user }, 'Profil mis à jour.');
}

export async function changePassword(req: Request, res: Response) {
  await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  sendSuccess(res, null, 'Mot de passe modifié. Reconnectez-vous.');
}

export async function uploadAvatar(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'Fichier requis' });
    return;
  }
  const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'avatars', {
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  });
  const { prisma } = await import('../../config/database');
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { avatar: url, avatarPublicId: publicId },
  });
  sendSuccess(res, { avatarUrl: url }, 'Avatar mis à jour.');
}
