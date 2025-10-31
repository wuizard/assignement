<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TodoController extends Controller
{
    public function update(Request $request, string $id) {
        $data = $request->validate(['done' => 'required|boolean']);
        $userId = $request->user()->id;

        return DB::transaction(function () use ($id, $userId, $data) {
            $todo = Todo::query()
                ->whereKey($id)
                ->whereHas('task', fn ($q) => $q->where('user_id', $userId))
                ->lockForUpdate()
                ->firstOrFail();

            $todo->done = $data['done'];
            $todo->save();

            return response()->json(['data' => $todo->fresh()], 200);
        });
    }
}