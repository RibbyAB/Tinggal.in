<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rental_id')->constrained('rentals')->restrictOnDelete();
            $table->integer('bill_month');
            $table->integer('bill_year');
            $table->decimal('amount', 12, 2);
            $table->timestamp('due_date');
            $table->enum('status', ['UNPAID', 'PENDING_VERIFICATION', 'PAID', 'OVERDUE'])->default('UNPAID');
            $table->timestamps();

            $table->unique(['rental_id', 'bill_month', 'bill_year'], 'bills_unique_per_month');
            $table->index('status');
            $table->index(['bill_year', 'bill_month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
