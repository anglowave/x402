"""
Setup configuration for x402 Python package
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="x402-solana",
    version="0.1.0",
    author="x402 Contributors",
    author_email="",
    description="HTTP 402 Payment Protocol for Solana - Python Implementation",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/HaidarIDK/x402",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Office/Business :: Financial",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.8",
    install_requires=[
        "solana>=0.30.0",
        "solders>=0.18.0",
        "spl-token>=0.2.0",
        "requests>=2.28.0",
    ],
    extras_require={
        "flask": ["flask>=2.0.0"],
        "fastapi": ["fastapi>=0.100.0", "uvicorn>=0.23.0"],
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "x402=x402.cli:main",
        ],
    },
)


