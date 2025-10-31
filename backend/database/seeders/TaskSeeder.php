<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void {

        $userIds = User::query()->pluck('id');
        if ($userIds->isEmpty()) {
            $this->command->warn('No users found. Register users first.');
            return;
        }

        Task::factory()
            ->count(100)
            ->state(function () use ($userIds) {
                return ['user_id' => $userIds->random()];
            })
            ->afterCreating(function (Task $task) {
                $n = rand(0, 5);
                if ($n > 0) \App\Models\Todo::factory()->count($n)->for($task)->create();
            })
            ->create();
    }
}
