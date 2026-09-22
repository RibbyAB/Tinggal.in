<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_number',
        'floor',
        'type',
        'price',
        'capacity',
        'status',
        'facilities',
        'description',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'floor' => 'integer',
        'capacity' => 'integer',
    ];

    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }
}
