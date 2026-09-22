<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique();
            $table->integer('floor');
            $table->enum('type', ['STANDARD', 'DELUXE', 'VIP'])->default('STANDARD');
            $table->decimal('price', 12, 2);
            $table->integer('capacity')->default(1);
            $table->enum('status', ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])->default('AVAILABLE');
            $table->text('facilities')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('type');
            $table->index('floor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
