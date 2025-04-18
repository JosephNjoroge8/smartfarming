<?php

namespace App\Policies;

use App\Models\Admin;
use Illuminate\Auth\Access\HandlesAuthorization;

class AdminPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Admin $admin): bool
    {
        return $admin->isSuperAdmin();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Admin $admin): bool
    {
        return $admin->isSuperAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Admin $admin, Admin $targetAdmin): bool
    {
        // Super admins can update any admin
        if ($admin->isSuperAdmin()) {
            return true;
        }

        // Regular admins can only update themselves
        return $admin->id === $targetAdmin->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Admin $admin, Admin $targetAdmin): bool
    {
        // Only super admins can delete admins, and they can't delete themselves
        return $admin->isSuperAdmin() && $admin->id !== $targetAdmin->id;
    }
}