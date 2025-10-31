<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\Todo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Todo>
 */
class TodoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Todo::class;
    public function definition(): array
    {
        return [
            'task_id' => Task::factory(),               // can be overridden with ->for($task)
            'title'   => $this->faker->sentence(3),
            'done'    => $this->faker->boolean(40),
        ];
    }
}
