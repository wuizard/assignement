<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskLog extends Model
{
    use HasUuids;

    public $timestamps = false;
    protected $fillable = ['task_id','log','created_at'];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function task(): BelongsTo {
        return $this->belongsTo(Task::class);
    }
}


