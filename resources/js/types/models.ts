export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    tax_identification_number: string | null;
    default_currency: string;
    preferences: Record<string, unknown> | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Receipt {
    id: number;
    user_id: number;
    image_path: string;
    thumbnail_path: string | null;
    original_filename: string | null;
    file_size: number | null;
    mime_type: string | null;
    source: 'upload' | 'camera' | 'scan' | null;
    merchant_name: string | null;
    total_amount: string;
    currency: string;
    tax_amount: string | null;
    subtotal_amount: string | null;
    payment_method: string | null;
    receipt_number: string | null;
    purchase_date: string | null;
    ocr_data: Record<string, unknown> | null;
    ai_confidence_score: string | null;
    ai_raw_response: Record<string, unknown> | null;
    additional_fields: Record<string, string> | null;
    metadata: ReceiptMetadata | null;
    notes: string | null;
    status: 'pending' | 'processing' | 'review_needed' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
    transactions?: Transaction[];
    image_url?: string;
    thumbnail_url?: string;
}

export interface ReceiptMetadataItem {
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface ReceiptMetadata {
    category: string | null;
    description: string | null;
    is_taxable: boolean | null;
    tax_type: string | null;
    items: ReceiptMetadataItem[] | null;
}

export interface Transaction {
    id: number;
    user_id: number;
    receipt_id: number | null;
    category_id: number | null;
    description: string;
    amount: string;
    currency: string;
    transaction_date: string;
    is_tax_deductible: boolean;
    tax_category: string | null;
    lhdn_category_code: string | null;
    tax_relief_amount: string | null;
    tax_year: number | null;
    notes: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    category?: Category;
    receipt?: Receipt;
}

export interface Category {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    sort_order: number;
    is_system: boolean;
    lhdn_category_code: string | null;
    tax_relief_limit: string | null;
    created_at: string;
    updated_at: string;
    transactions_count?: number;
    total_amount?: string;
}

export interface LhdnTaxRelief {
    id: number;
    code: string;
    name: string;
    description: string | null;
    annual_limit: string;
    tax_year: number;
    parent_code: string | null;
    is_active: boolean;
    metadata: Record<string, unknown> | null;
    claimed_amount?: number;
    receipt_count?: number;
}

export interface MedicalCertificate {
    id: number;
    user_id: number;
    image_path: string;
    thumbnail_path: string | null;
    original_filename: string | null;
    file_size: number | null;
    mime_type: string | null;
    source: 'upload' | 'camera' | 'scan' | null;
    patient_name: string | null;
    doctor_name: string | null;
    clinic_name: string | null;
    diagnosis: string | null;
    mc_start_date: string | null;
    mc_end_date: string | null;
    mc_days: number | null;
    mc_number: string | null;
    issue_date: string | null;
    doctor_reg_number: string | null;
    notes: string | null;
    ocr_data: Record<string, unknown> | null;
    ai_confidence_score: string | null;
    ai_raw_response: Record<string, unknown> | null;
    additional_fields: Record<string, string> | null;
    status: 'pending' | 'processing' | 'review_needed' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
    image_url?: string;
    thumbnail_url?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface PageProps {
    auth: {
        user: User;
    };
    flash: {
        success?: string;
        error?: string;
    };
    appName: string;
    [key: string]: unknown;
}

export interface DashboardStats {
    total_receipts: number;
    receipts_this_month: number;
    spending_this_month: number;
    tax_deductible_ytd: number;
    pending_reviews: number;
}

export interface MonthlySpending {
    month: string;
    total: number;
    tax_deductible: number;
}

export interface CategoryDistribution {
    name: string;
    color: string;
    total: number;
    count: number;
}

export interface TaxReliefProgress {
    code: string;
    name: string;
    description?: string | null;
    annual_limit: number;
    claimed_amount: number;
    receipt_count: number;
    percentage: number;
    parent_code?: string | null;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'e_wallet' | 'online_banking' | 'bank_transfer';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    cash: 'Cash',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    e_wallet: 'E-Wallet',
    online_banking: 'Online Banking',
    bank_transfer: 'Bank Transfer',
};
