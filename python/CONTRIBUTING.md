# Contributing to x402 Python Implementation

Thank you for your interest in contributing to x402! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Git
- Basic understanding of Solana and HTTP protocols

### Development Setup

1. **Fork and Clone**

```bash
git clone https://github.com/YOUR_USERNAME/x402.git
cd x402/python
```

2. **Create Virtual Environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies**

```bash
pip install -r requirements.txt
pip install -e ".[dev]"
```

4. **Run Tests**

```bash
pytest
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Test additions or modifications
- `refactor/` - Code refactoring

### 2. Make Changes

- Write clean, readable code
- Follow PEP 8 style guidelines
- Add docstrings to all public functions/classes
- Include type hints where appropriate

### 3. Write Tests

- Add tests for new features
- Ensure all tests pass: `pytest`
- Aim for high test coverage: `pytest --cov=x402`

### 4. Format Code

```bash
# Format with black
black x402 tests examples

# Check with flake8
flake8 x402 tests

# Type check with mypy
mypy x402
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style

### Python Style Guide

Follow PEP 8 with these specifics:

```python
# Good
def create_payment_request(
    amount: float,
    recipient: str,
    resource: str,
) -> PaymentRequest:
    """
    Create a new payment request
    
    Args:
        amount: Payment amount in token units
        recipient: Recipient's public key
        resource: Resource identifier
    
    Returns:
        PaymentRequest object
    """
    pass

# Bad
def create_payment_request(amount,recipient,resource):
    pass
```

### Documentation

All public APIs must have docstrings:

```python
def public_function(param: str) -> bool:
    """
    Brief description of what the function does.
    
    Longer description if needed, explaining behavior,
    edge cases, and examples.
    
    Args:
        param: Description of parameter
    
    Returns:
        Description of return value
    
    Raises:
        ValueError: When param is invalid
    
    Example:
        >>> result = public_function("test")
        >>> print(result)
        True
    """
    pass
```

## Testing Guidelines

### Writing Tests

```python
import pytest
from x402 import X402Client

def test_feature():
    """Test description"""
    # Arrange
    client = X402Client(keypair)
    
    # Act
    result = client.some_method()
    
    # Assert
    assert result is not None
```

### Test Categories

- **Unit Tests**: Test individual functions/methods
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete workflows

### Running Tests

```bash
# All tests
pytest

# Specific file
pytest tests/test_client.py

# Specific test
pytest tests/test_client.py::test_feature

# With coverage
pytest --cov=x402 --cov-report=html

# Verbose output
pytest -v
```

## Areas for Contribution

### High Priority

- [ ] Async client implementation
- [ ] Django middleware
- [ ] Payment streaming support
- [ ] Subscription management
- [ ] CLI tools
- [ ] Performance optimizations

### Medium Priority

- [ ] Additional SPL token support
- [ ] Payment analytics
- [ ] Webhook support
- [ ] Rate limiting utilities
- [ ] Caching improvements

### Documentation

- [ ] More examples
- [ ] Video tutorials
- [ ] API reference
- [ ] Architecture diagrams
- [ ] Best practices guide

### Testing

- [ ] Increase test coverage
- [ ] Integration tests
- [ ] Performance benchmarks
- [ ] Load testing

## Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add docstrings to new code
   - Update CHANGELOG.md

2. **Ensure Tests Pass**
   - All existing tests pass
   - New tests added for new features
   - Coverage maintained or improved

3. **Code Review**
   - Address reviewer feedback
   - Keep discussions constructive
   - Be patient and respectful

4. **Merge Requirements**
   - At least one approval
   - All CI checks passing
   - No merge conflicts
   - Up to date with main branch

## Reporting Bugs

### Before Reporting

- Check existing issues
- Verify it's a bug (not expected behavior)
- Test with latest version

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Step 1
2. Step 2
3. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Python Version: [e.g., 3.10]
- x402 Version: [e.g., 0.1.0]

**Additional Context**
Any other relevant information
```

## Feature Requests

### Feature Request Template

```markdown
**Problem**
What problem does this feature solve?

**Proposed Solution**
How should this feature work?

**Alternatives**
Other solutions you've considered

**Additional Context**
Any other relevant information
```

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

## Questions?

- Open a GitHub Discussion
- Check existing documentation
- Ask in Pull Request comments

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to x402! 🙏**

Your contributions help make micropayments accessible to everyone!


