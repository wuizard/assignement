<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email'=> 'required|email|unique:users',
            'password' => 'required|min:8'
        ]);
        $user = User::create([
            'name' => $data['name'],
            'email'=> $data['email'],
            'password' => Hash::make($data['password'])
        ]);
        if (Auth::attempt($data)) {
            $request->session()->regenerate();   // 🔑 critical
        }
        $user->createToken('api')->plainTextToken;
        return response()->json(['message' => "Register Success. Please Login to your Account"], 200);
    }

    public function login(Request $request) {
        $data = $request->validate([
            'email'=> 'required|email',
            'password' => 'required'
        ]);
        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 400);
        }
        if (Auth::attempt($data)) {
            $request->session()->regenerate();   // 🔑 critical
        }
        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['token' => $token]);
    }

    public function me(Request $request) {
        return $request->user();
    }

    public function logout(Request $request) {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Logged out (token revoked)'], 200);
        }

        // If authenticated via session cookies (SPA mode)
        if (Auth::check()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return response()->json(['message' => 'Logged out (session)'], 200);
        }
        return response()->json(['message' => 'Unauthenticated'], 401);
    }
}
