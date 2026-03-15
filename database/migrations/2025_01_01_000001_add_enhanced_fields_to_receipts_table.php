<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->string('currency', 10)->default('MYR')->after('total_amount');
            $table->decimal('tax_amount', 10, 2)->nullable()->after('currency');
            $table->decimal('subtotal_amount', 10, 2)->nullable()->after('tax_amount');
            $table->string('payment_method')->nullable()->after('subtotal_amount');
            $table->string('receipt_number')->nullable()->after('payment_method');
            $table->decimal('ai_confidence_score', 5, 2)->nullable()->after('ocr_data');
            $table->json('ai_raw_response')->nullable()->after('ai_confidence_score');
            $table->json('additional_fields')->nullable()->after('ai_raw_response');
            $table->text('notes')->nullable()->after('additional_fields');
            $table->string('thumbnail_path')->nullable()->after('image_path');
            $table->string('original_filename')->nullable()->after('thumbnail_path');
            $table->unsignedInteger('file_size')->nullable()->after('original_filename');
            $table->string('mime_type')->nullable()->after('file_size');
            $table->string('source')->nullable()->after('mime_type');
        });
    }

    public function down(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->dropColumn([
                'currency', 'tax_amount', 'subtotal_amount', 'payment_method',
                'receipt_number', 'ai_confidence_score', 'ai_raw_response',
                'additional_fields', 'notes', 'thumbnail_path', 'original_filename',
                'file_size', 'mime_type', 'source',
            ]);
        });
    }
};
