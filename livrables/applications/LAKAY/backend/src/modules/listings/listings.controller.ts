import { Request, Response } from 'express';
import * as listingsService from './listings.service';
import { sendSuccess } from '../../utils/response';

export async function createListing(req: Request, res: Response) {
  const listing = await listingsService.createListing(req.user!.id, req.body);
  sendSuccess(res, { listing }, 'Annonce créée', 201);
}

export async function updateListing(req: Request, res: Response) {
  const listing = await listingsService.updateListing(req.params.id, req.user!.id, req.user!.role, req.body);
  sendSuccess(res, { listing }, 'Annonce mise à jour');
}

export async function deleteListing(req: Request, res: Response) {
  await listingsService.deleteListing(req.params.id, req.user!.id, req.user!.role);
  sendSuccess(res, null, 'Annonce supprimée');
}

export async function getListing(req: Request, res: Response) {
  const listing = await listingsService.getListingById(req.params.id, req.user?.id, req.user?.role);
  sendSuccess(res, { listing });
}

export async function getListingContact(req: Request, res: Response) {
  const contact = await listingsService.getListingContact(req.params.id, req.user!.id);
  sendSuccess(res, contact);
}

export async function getMyListings(req: Request, res: Response) {
  const result = await listingsService.getMyListings(req.user!.id, req.query as Record<string, string>);
  sendSuccess(res, result.listings, 'Mes annonces', 200, { pagination: result.pagination });
}

export async function submitForReview(req: Request, res: Response) {
  const listing = await listingsService.submitForReview(req.params.id, req.user!.id);
  sendSuccess(res, { listing }, 'Annonce soumise à la validation');
}

export async function reviewListing(req: Request, res: Response) {
  const listing = await listingsService.reviewListing(
    req.params.id,
    req.user!.id,
    req.body.action,
    req.body.rejectionReason
  );
  sendSuccess(res, { listing }, `Annonce ${req.body.action === 'APPROVE' ? 'approuvée' : 'rejetée'}`);
}

export async function uploadImages(req: Request, res: Response) {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    return;
  }
  const images = await listingsService.uploadListingImages(req.params.id, req.user!.id, files);
  sendSuccess(res, { images }, `${images.length} image(s) uploadée(s)`, 201);
}

export async function deleteImage(req: Request, res: Response) {
  await listingsService.deleteListingImage(req.params.imageId, req.user!.id);
  sendSuccess(res, null, 'Image supprimée');
}

export async function renewListing(req: Request, res: Response) {
  const listing = await listingsService.renewListing(req.params.id, req.user!.id);
  sendSuccess(res, { listing }, 'Annonce renouvelée');
}

export async function getSimilarListings(req: Request, res: Response) {
  const listings = await listingsService.getSimilarListings(req.params.id);
  sendSuccess(res, { listings });
}

export async function getFeaturedListings(req: Request, res: Response) {
  const listings = await listingsService.getFeaturedListings();
  sendSuccess(res, { listings });
}

export async function getPendingListings(req: Request, res: Response) {
  const result = await listingsService.getPendingListings(req.query as Record<string, string>);
  sendSuccess(res, result.listings, 'Annonces en attente', 200, { pagination: result.pagination });
}
