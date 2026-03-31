# Laravel Backend Implementation (Indigo API)

This guide provides the necessary PHP code to implement the `POST /v1/recruitment/invite` endpoint as requested by the Lead Programmer for the "Invite Lead" workflow.

## 1. Controller Implementation

Put this logic in `app/Http/Controllers/Api/NewStudentsController.php` (or similar).

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class NewStudentsController extends Controller
{
    /**
     * Invite Lead - Register student in import_students_full table
     */
    public function invite(Request $request)
    {
        // 1. Validation
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'parent_email' => 'required|email|max:255',
            'student_email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'subscription_amount' => 'required|numeric',
            'contract_type' => [
                'required',
                Rule::in(['contract_399', 'contract_489', 'contract_600', 'contract_689'])
            ],
            'discount' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $nickname = $request->student_email; // Student's email is used as login/nickname

        // 2. Unique Nickname Check (Requirement 8)
        // Before insertion check nickname in import_students_full and recruting_student
        $existsInImport = DB::table('import_students_full')
            ->where('nickname', $nickname)
            ->exists();

        $existsInRecruiting = DB::table('recruting_student')
            ->where('nickname', $nickname) // Adjust column name if different
            ->exists();

        if ($existsInImport || $existsInRecruiting) {
            return response()->json([
                'message' => 'Nickname (student email) already exists in recruitment or import tables.'
            ], 409);
        }

        // 3. Database Insertion (Requirement 1-7)
        try {
            DB::table('import_students_full')->insert([
                'is_send' => 0,              // Mark as not yet sent for TargetMail
                'is_done' => 0,              // Mark as not processed
                'first_name' => $request->first_name,
                'surname' => $request->surname,
                'phone' => $request->phone,
                'email' => $request->parent_email,         // Parent's Email
                'parent_email' => $request->parent_email,  // Parent's Email
                'nickname' => $nickname,                   // Student's Email (Login)
                'subscription_amount' => $request->subscription_amount,
                'contract_old_new' => $request->contract_type, // Only allowed from list
                'discount' => $request->discount ?? 0,
                'balance_overpayment' => 0,  // Initial balance
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Invitation created successfully and queued for sending.'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to invite student: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

## 2. API Route Registration

Add the following to `routes/api.php` within the `v1` prefix group.

```php
Route::prefix('v1')->group(function () {
    // ... other routes
    Route::post('/recruitment/invite', [NewStudentsController::class, 'invite']);
});
```

## 3. Configuration Checklist

> [!IMPORTANT]
> - Ensure the `import_students_full` table has all the columns mentioned above (`is_send`, `is_done`, `nickname`, `contract_old_new`, etc.).
> - Add index to the `nickname` column for faster lookups.
