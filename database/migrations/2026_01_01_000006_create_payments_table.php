<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bill_id')->constrained('bills')->restrictOnDelete();
            $table->decimal('amount', 12, 2);
            $table->enum('method', ['BANK_TRANSFER', 'CASH', 'E_WALLET'])->default('BANK_TRANSFER');
            $table->string('proof_file_path')->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->timestamp('paid_at')->useCurrent();

            $table->foreignId('verified_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_note')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('bill_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
