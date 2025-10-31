<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = ['title','description', 'status','deadline'];

    protected $casts = [
        'deadline'   => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function todos(): HasMany {
        return $this->hasMany(Todo::class);
    }

    public function logs(): HasMany {
        return $this->hasMany(TaskLog::class);
    }

    public function comments(): HasMany {
        return $this->hasMany(TaskComment::class);
    }

    public function user() : BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder {
        $term = trim((string) $term);
        if ($term === '') {
            return $query;
        }
        
        $words = preg_split('/\s+/', $term);
        return $query->where(function (Builder $text_search) use ($words) {
            foreach ($words as $w) {
                $like = '%'.str_replace(['%','_'], ['\%','\_'], $w).'%';
                $text_search->where(function (Builder $query_search) use ($like) {
                    $query_search->where('title', 'like', $like)
                       ->orWhere('description', 'like', $like);
                });
            }
        });
    }

}
