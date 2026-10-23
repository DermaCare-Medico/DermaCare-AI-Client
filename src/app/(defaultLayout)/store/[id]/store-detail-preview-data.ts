export interface StoreMedicineDetailPreview {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  packSize: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  requiresPrescription: boolean;
  inStock: boolean;
  stockQuantity: number;
  manufacturer: string;
  storageInstructions: string;
  imageLabels: string[];
}

export const STORE_DETAIL_PREVIEW_NOTICE =
  "Preview details only. Ordering, cart updates, payments, and prescription validation are not connected.";

export const storeMedicineDetailPreviews: StoreMedicineDetailPreview[] = [
  { id: "med_demo_001", name: "Hydrocortisone 1% Cream", genericName: "Hydrocortisone", strength: "1%", dosageForm: "Topical cream", packSize: "30 g tube", category: "Corticosteroids", description: "A fictional catalogue preview for a mild topical corticosteroid product. Use only according to advice from a qualified clinician or pharmacist.", price: 6.5, currency: "USD", requiresPrescription: true, inStock: true, stockQuantity: 40, manufacturer: "DermaCare Labs (fictional)", storageInstructions: "Store below 25°C. Do not freeze.", imageLabels: ["Front packaging", "Tube preview", "Product information"] },
  { id: "med_demo_002", name: "Cetirizine 10mg Tablets", genericName: "Cetirizine hydrochloride", strength: "10 mg", dosageForm: "Oral tablet", packSize: "10 tablets", category: "Antihistamines", description: "A fictional catalogue preview for an oral antihistamine product. Read the medicine information and seek professional advice when needed.", price: 3.2, currency: "USD", requiresPrescription: false, inStock: true, stockQuantity: 120, manufacturer: "DermaCare Labs (fictional)", storageInstructions: "Store in a dry place below 30°C.", imageLabels: ["Front packaging", "Blister preview", "Product information"] },
  { id: "med_demo_003", name: "Clindamycin 1% Gel", genericName: "Clindamycin phosphate", strength: "1%", dosageForm: "Topical gel", packSize: "20 g tube", category: "Antibiotics", description: "A fictional catalogue preview for a topical antibiotic product. A valid prescription would be required before a real order could proceed.", price: 9.9, currency: "USD", requiresPrescription: true, inStock: false, stockQuantity: 0, manufacturer: "DermaCare Labs (fictional)", storageInstructions: "Store below 25°C.", imageLabels: ["Front packaging", "Tube preview", "Product information"] },
  { id: "med_demo_004", name: "Ceramide Barrier Moisturiser", genericName: "Ceramide blend", strength: "—", dosageForm: "Topical lotion", packSize: "200 ml bottle", category: "Emollients", description: "A fictional fragrance-free moisturiser catalogue preview designed to demonstrate barrier-care product details.", price: 12, currency: "USD", requiresPrescription: false, inStock: true, stockQuantity: 60, manufacturer: "DermaCare Labs (fictional)", storageInstructions: "Store at room temperature.", imageLabels: ["Front packaging", "Bottle preview", "Product information"] },
];

export function getStoreMedicineDetailPreview(id: string) {
  return storeMedicineDetailPreviews.find((medicine) => medicine.id === id);
}
