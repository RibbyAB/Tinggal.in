<?php

namespace App\Exceptions;

use Exception;

class AppException extends Exception
{
    public function __construct(string $message, public readonly int $statusCode = 400)
    {
        parent::__construct($message);
    }
}
