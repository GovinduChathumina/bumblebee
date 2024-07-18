<?php

namespace App\Http\Controllers;

use Exception;
use App\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\TodoCollection;
use App\Http\Resources\TodoResource;
use App\Http\Controllers\ApiController;

class TodoController extends ApiController
{
    public function index(Request $request)
    {
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $collection = Todo::where('user_id', $user->id);

        if ($status = $request->query('status')) {
            if (in_array($status, ['open', 'closed'])) {
                $collection = $collection->where('status', $status);
            }
        }

        $collection = $collection->latest()->paginate();

        if ($status) {
            $collection = $collection->appends('status', $status);
        }

        return new TodoCollection($collection);
    }

    public function store(Request $request)
    {
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $validator = Validator::make($request->all(), [
            'value' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->responseUnprocessable($validator->errors());
        }

        try {
            $todo = Todo::create([
                'user_id' => $user->id,
                'value' => $request->input('value'),
            ]);
            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $todo->id
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError(['Error creating resource.']);
        }
    }

    public function show(Request $request, $id)
    {
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $todo = Todo::where('id', $id)->firstOrFail();

        if ($todo->user_id !== $user->id) {
            return $this->responseUnauthorized();
        }

        return new TodoResource($todo);
    }

    public function update(Request $request, $id)
    {
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $validator = Validator::make($request->all(), [
            'value' => 'string',
            'status' => 'in:closed,open',
        ]);

        if ($validator->fails()) {
            return $this->responseUnprocessable($validator->errors());
        }

        try {
            $todo = Todo::where('id', $id)->firstOrFail();
            if ($todo->user_id === $user->id) {
                if ($request->input('value')) {
                    $todo->value = $request->input('value');
                }
                if ($request->input('status')) {
                    $todo->status = $request->input('status');
                }
                $todo->save();
                return $this->responseResourceUpdated();
            } else {
                return $this->responseUnauthorized();
            }
        } catch (Exception $e) {
            return $this->responseServerError(['Error updating resource.']);
        }
    }

    public function destroy(Request $request, $id)
    {
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $todo = Todo::where('id', $id)->firstOrFail();

        if ($todo->user_id !== $user->id) {
            return $this->responseUnauthorized();
        }

        try {
            $todo->delete();
            return $this->responseResourceDeleted();
        } catch (Exception $e) {
            return $this->responseServerError(['Error deleting resource.']);
        }
    }
}
