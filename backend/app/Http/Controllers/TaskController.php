<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $term = $request->string('query')->toString();
        $statuses = collect($request->input('status', []))
            ->when(is_string($request->input('status')), fn ($c) => collect([$request->input('status')]))
            ->filter()
            ->unique()
            ->values();

        $limit = (int) $request->integer('limit', 20);
        $limit = $limit > 0 ? min($limit, 100) : 20;

        $query = $request->user()
            ->tasks()
            ->with('todos')
            ->when($statuses->isNotEmpty(), fn ($q) => $q->whereIn('status', $statuses))
            ->search($term)
            ->latest();

        // ->cursorPaginate($perPage); // 👈 great for infinite scroll

        $tasks = $query
            ->paginate($limit)
            ->appends($request->query());

        // TaskResource
        // return response()->json([
        //     'data' => $tasks,
        // ], 200);

        return TaskResource::collection($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'=> ['required_with:todos','string','max:80'],
            'description' => ['nullable','string'],
            'deadline' => ['nullable','date'],
            'todos' => ['nullable','array'],
            'todos.*.title' => ['required_with:todos','string','max:255'],
            'todos.*.done' => ['required_with:todos','boolean'],
        ]);

        return DB::transaction(function () use ($request, $data) {
            $task = $request->user()->tasks()->create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'user_id' => $request->user()->id,
                'deadline' => $data['deadline'] ?? null,
            ]);

            if (!empty($data['todos'])) {
                // normalize payload for createMany
                $rows = array_map(function ($t) use ($task) {
                    return [
                        'title' => $t['title'],
                        'done' => (bool) $t['done'],
                    ];
                }, $data['todos']);

                $task->todos()->createMany($rows);
            }

            return response()->json($task->load('todos'), 200);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        //
        $task = Task::whereKey($id)
            ->where('user_id', $request->user()->id)
            ->with('todos')
            ->latest()
            ->firstOrFail();

        return response()->json([
            'data' => $task,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            'title'       => 'sometimes|required|string|max:150',
            'description' => 'sometimes|nullable|string',
            'status'      => 'sometimes|in:todo,in_progress,done,archived',
            'deadline'    => 'sometimes|nullable|date',

            // optional todos array to upsert
            'todos'              => 'sometimes|array',
            'todos.*.id'         => 'nullable|string',    // if present, update; else create
            'todos.*.title'      => 'required|string|max:150',
            'todos.*.done'       => 'required|boolean',
        ]);

        $userId = $request->user()->id;

        return DB::transaction(function () use ($id, $userId, $data) {
            $task = Task::query()
                ->whereKey($id)
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->firstOrFail();

            $task->fill(Arr::only($data, ['title','description','status','deadline']));
            $task->save();

            if (array_key_exists('todos', $data)) {
                $incoming = collect($data['todos']);

                $incomingIds = $incoming->pluck('id')->filter()->values();

                Todo::where('task_id', $task->id)
                    ->when($incomingIds->isNotEmpty(), fn($q) => $q->whereNotIn('id', $incomingIds))
                    ->when($incomingIds->isEmpty(), fn($q) => $q)
                    ->delete();

                foreach ($incoming as $row) {
                    $payload = [
                        'title' => $row['title'],
                        'done'  => (bool) $row['done'],
                    ];
                    $todo = Todo::where('id', $row['id'] ?? null)
                        ->where('task_id', $task->id)   // enforce owner via parent task
                        ->lockForUpdate()               // prevent race conditions
                        ->first();

                    if ($todo) {
                        $todo->update($payload);
                    } else {
                        $task->todos()->create($payload);
                    }
                }
            }
            
            $task->load('todos');

            return response()->json(['data' => $task], 200);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $task = Task::whereKey($id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $todos = Todo::query()
            ->where('task_id', $id);

        $task->delete(); // cascades to todos if FK has cascadeOnDelete
        $todos->delete();

        return response()->json([
            'message' => 'Task Deleted',
        ], 200);
    }

    public function taskStatus(Request $request, string $id)
    {
        $payload = $request->validate([
            "status" => 'required'
        ]);

        $task = Task::whereKey($id)
            ->lockForUpdate()               // prevent race conditions
            ->first();

        $task->update($payload);

        return response()->json([
            'message' => 'Task Deleted',
        ], 200);
    }
}
