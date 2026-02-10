import pytest
import importlib
import sys
import os

sys.path.insert(0, os.environ.get("BENCH_WORKSPACE", os.getcwd()))

def get_parser():
    if "csv_parser" in sys.modules:
        importlib.reload(sys.modules["csv_parser"])
    else:
        importlib.import_module("csv_parser")
    return sys.modules["csv_parser"].parse_csv


def test_simple_csv():
    parse_csv = get_parser()
    result = parse_csv("a,b,c\n1,2,3")
    assert result == [["a", "b", "c"], ["1", "2", "3"]]


def test_quoted_field_with_comma():
    parse_csv = get_parser()
    result = parse_csv('name,description\nAlice,"hello, world"')
    assert result == [["name", "description"], ["Alice", "hello, world"]]


def test_quoted_field_with_newline():
    parse_csv = get_parser()
    result = parse_csv('name,bio\nAlice,"line1\nline2"')
    assert result == [["name", "bio"], ["Alice", "line1\nline2"]]


def test_escaped_quotes():
    parse_csv = get_parser()
    result = parse_csv('name,quote\nAlice,"She said ""hello"""')
    assert result == [["name", "quote"], ["Alice", 'She said "hello"']]


def test_mixed_quoted_unquoted():
    parse_csv = get_parser()
    result = parse_csv('a,"b,c",d')
    assert result == [["a", "b,c", "d"]]


def test_empty_fields():
    parse_csv = get_parser()
    result = parse_csv("a,,c\n1,2,")
    assert result == [["a", "", "c"], ["1", "2", ""]]


def test_single_column():
    parse_csv = get_parser()
    result = parse_csv("name\nAlice\nBob")
    assert result == [["name"], ["Alice"], ["Bob"]]
