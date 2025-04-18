<?php

namespace App\Policies;

use App\Models\Crop;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CropPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(User $user)
    {
        return true;
    }
    
    public function view(User $user, Crop $crop)
    {
        return $user->id === $crop->user_id;
    }
    
    public function create(User $user)
    {
        return true;
    }
    
    public function update(User $user, Crop $crop)
    {
        return $user->id === $crop->user_id;
    }
    
    public function delete(User $user, Crop $crop)
    {
        return $user->id === $crop->user_id;
    }
}