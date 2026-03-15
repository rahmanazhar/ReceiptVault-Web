<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('original_filename')->nullable();
            $table->unsignedInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('source')->nullable(); // upload, camera, scan
            $table->string('document_type')->nullable(); // summons, business_card, contract, letter, invoice, warranty, certificate, other
            $table->string('title')->nullable();
            $table->string('sender')->nullable();
            $table->string('recipient')->nullable();
            $table->string('reference_number')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->json('ocr_data')->nullable();
            $table->decimal('ai_confidence_score', 5, 2)->nullable();
            $table->json('ai_raw_response')->nullable();
            $table->json('additional_fields')->nullable();
            $table->json('metadata')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('status');
            $table->index('document_type');
            $table->index('issue_date');
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
