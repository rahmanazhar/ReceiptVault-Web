<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('tax_identification_number')->nullable()->after('phone');
            $table->string('default_currency', 10)->default('MYR')->after('tax_identification_number');
            $table->json('preferences')->nullable()->after('default_currency');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'tax_identification_number', 'default_currency', 'preferences']);
        });
    }
};
