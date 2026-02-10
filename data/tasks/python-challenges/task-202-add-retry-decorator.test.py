import pytest
import importlib
import sys
import os
import time

sys.path.insert(0, os.environ.get("BENCH_WORKSPACE", os.getcwd()))

def get_retry():
    if "retry" in sys.modules:
        importlib.reload(sys.modules["retry"])
    else:
        importlib.import_module("retry")
    return sys.modules["retry"].retry


def test_retry_on_failure():
    retry = get_retry()
    call_count = 0

    @retry(max_retries=3)
    def flaky():
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise ValueError("not yet")
        return "success"

    result = flaky()
    assert result == "success"
    assert call_count == 3


def test_retry_exhausted():
    retry = get_retry()

    @retry(max_retries=2)
    def always_fails():
        raise RuntimeError("always fails")

    with pytest.raises(RuntimeError, match="always fails"):
        always_fails()


def test_no_retry_on_success():
    retry = get_retry()
    call_count = 0

    @retry(max_retries=5)
    def works_first_time():
        nonlocal call_count
        call_count += 1
        return 42

    result = works_first_time()
    assert result == 42
    assert call_count == 1


def test_retry_specific_exceptions():
    retry = get_retry()
    call_count = 0

    @retry(max_retries=3, exceptions=(ValueError,))
    def raises_type_error():
        nonlocal call_count
        call_count += 1
        raise TypeError("wrong type")

    with pytest.raises(TypeError):
        raises_type_error()
    assert call_count == 1  # Should not retry TypeError


def test_preserves_function_name():
    retry = get_retry()

    @retry(max_retries=3)
    def my_function():
        """My docstring."""
        pass

    assert my_function.__name__ == "my_function"
    assert my_function.__doc__ == "My docstring."


def test_retry_returns_value():
    retry = get_retry()

    @retry(max_retries=1)
    def returns_dict():
        return {"key": "value"}

    assert returns_dict() == {"key": "value"}
