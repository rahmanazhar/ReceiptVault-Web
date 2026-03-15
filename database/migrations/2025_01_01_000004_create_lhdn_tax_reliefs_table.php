<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lhdn_tax_reliefs', function (Blueprint $table) {
            $table->id();
            $table->string('code')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('annual_limit', 10, 2);
            $table->unsignedSmallInteger('tax_year');
            $table->string('parent_code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['code', 'tax_year']);
            $table->index('tax_year');
            $table->index('parent_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lhdn_tax_reliefs');
    }
};
