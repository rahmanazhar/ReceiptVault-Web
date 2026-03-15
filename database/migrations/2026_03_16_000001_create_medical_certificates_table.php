<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('original_filename')->nullable();
            $table->unsignedInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('source')->nullable(); // upload, camera, scan
            $table->string('patient_name')->nullable();
            $table->string('doctor_name')->nullable();
            $table->string('clinic_name')->nullable();
            $table->text('diagnosis')->nullable();
            $table->date('mc_start_date')->nullable();
            $table->date('mc_end_date')->nullable();
            $table->unsignedInteger('mc_days')->nullable();
            $table->string('mc_number')->nullable();
            $table->date('issue_date')->nullable();
            $table->string('doctor_reg_number')->nullable();
            $table->text('notes')->nullable();
            $table->json('ocr_data')->nullable();
            $table->decimal('ai_confidence_score', 5, 2)->nullable();
            $table->json('ai_raw_response')->nullable();
            $table->json('additional_fields')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('status');
            $table->index('mc_start_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_certificates');
    }
};
