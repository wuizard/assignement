<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Task::class;

    public function definition(): array {
        $hasDeadline = $this->faker->boolean(70);
        return [
            'title' => $this->faker->randomElement(['Implement auth', 'Fix checkout bug', 'Ship v1', 'Assignment', 
                'Shopping with GF', 'Shopping with Mom', 'Ship v2', 'Bugs Fixes', 'Staging Preparation', 'Design Frontend']),
            'description'=> $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['todo','in_progress','done','archived']),
            'deadline' => $hasDeadline ? $this->faker->dateTimeBetween('-10 days', '+30 days') : null,
        ];
    }
    public function done(): static {
        return $this->state(fn () => ['status' => 'done']);
    }
    public function withTodos(int $count = 0): static {
        return $this->afterCreating(function (Task $task) use ($count) {
            if ($count > 0) {
                \App\Models\Todo::factory()
                    ->count($count)
                    ->for($task) // sets task_id
                    ->create();
            }
        });
    }
}
