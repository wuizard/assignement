<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskComment extends Model
{
    use HasUuids;

    protected $fillable = ['task_id','user_id','comment'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function task(): BelongsTo {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
}

