<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TodoController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('tasks', TaskController::class);
    Route::patch('/todos/{id}', [TodoController::class, 'update']);
    Route::patch('/tasks-status/{id}', [TaskController::class, 'taskStatus']);
});