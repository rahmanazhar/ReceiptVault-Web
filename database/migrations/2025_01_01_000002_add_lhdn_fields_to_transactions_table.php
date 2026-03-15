<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('lhdn_category_code')->nullable()->after('tax_category');
            $table->decimal('tax_relief_amount', 10, 2)->nullable()->after('lhdn_category_code');
            $table->unsignedSmallInteger('tax_year')->nullable()->after('tax_relief_amount');
            $table->string('currency', 10)->default('MYR')->after('amount');

            $table->index('lhdn_category_code');
            $table->index('tax_year');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['lhdn_category_code']);
            $table->dropIndex(['tax_year']);
            $table->dropColumn(['lhdn_category_code', 'tax_relief_amount', 'tax_year', 'currency']);
        });
    }
};
