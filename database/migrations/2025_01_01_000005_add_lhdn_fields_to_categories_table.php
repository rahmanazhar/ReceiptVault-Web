<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('lhdn_category_code')->nullable()->after('is_system');
            $table->decimal('tax_relief_limit', 10, 2)->nullable()->after('lhdn_category_code');
            $table->string('icon')->nullable()->after('color');
            $table->unsignedInteger('sort_order')->default(0)->after('icon');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['lhdn_category_code', 'tax_relief_limit', 'icon', 'sort_order']);
        });
    }
};
