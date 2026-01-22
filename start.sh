#!/bin/bash

# PASAR E-commerce Platform - Startup Script
# This script guides you through starting the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script's directory (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/Backend"
FRONTEND_DIR="$SCRIPT_DIR/Frontend"

# Helper functions
print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing=()
    
    if ! command_exists node; then
        missing+=("Node.js")
    else
        print_success "Node.js found: $(node --version)"
    fi
    
    if ! command_exists npm; then
        missing+=("npm")
    else
        print_success "npm found: $(npm --version)"
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        print_error "Missing required tools: ${missing[*]}"
        print_info "Please install the missing tools and try again."
        exit 1
    fi
}

# Check Docker prerequisites
check_docker_prerequisites() {
    print_header "Checking Docker Prerequisites"
    
    if ! command_exists docker; then
        print_error "Docker is not installed."
        print_info "Please install Docker from https://www.docker.com/get-started"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"
    
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not installed."
        exit 1
    fi
    print_success "Docker Compose found"
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker daemon is running"
}

# Check local prerequisites (Java, Maven, PostgreSQL)
check_local_prerequisites() {
    print_header "Checking Local Prerequisites"
    
    local missing=()
    
    if ! command_exists java; then
        missing+=("Java 21")
    else
        print_success "Java found: $(java --version 2>&1 | head -n 1)"
    fi
    
    if [ ! -f "$BACKEND_DIR/mvnw" ]; then
        if ! command_exists mvn; then
            missing+=("Maven")
        else
            print_success "Maven found: $(mvn --version | head -n 1)"
        fi
    else
        print_success "Maven Wrapper found"
    fi
    
    if ! command_exists psql; then
        print_warning "PostgreSQL client (psql) not found - you may need to set up the database manually"
    else
        print_success "PostgreSQL client found"
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        print_error "Missing required tools: ${missing[*]}"
        print_info "Please install the missing tools and try again."
        exit 1
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    print_step "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Frontend dependencies installed"
    else
        print_success "Frontend dependencies already installed"
        read -p "Do you want to reinstall? (y/N): " reinstall
        if [[ "$reinstall" =~ ^[Yy]$ ]]; then
            rm -rf node_modules
            npm install
            print_success "Frontend dependencies reinstalled"
        fi
    fi
}

# Start with Docker
start_with_docker() {
    check_docker_prerequisites
    check_prerequisites
    
    print_header "Starting with Docker"
    
    cd "$BACKEND_DIR"
    
    # Check if JAR exists
    if [ ! -f "target/"*.jar ] 2>/dev/null; then
        print_step "Building backend JAR..."
        
        if [ -f "./mvnw" ]; then
            chmod +x ./mvnw
            ./mvnw clean package -DskipTests
        else
            mvn clean package -DskipTests
        fi
        print_success "Backend JAR built"
    else
        print_success "Backend JAR already exists"
        read -p "Do you want to rebuild? (y/N): " rebuild
        if [[ "$rebuild" =~ ^[Yy]$ ]]; then
            if [ -f "./mvnw" ]; then
                ./mvnw clean package -DskipTests
            else
                mvn clean package -DskipTests
            fi
            print_success "Backend JAR rebuilt"
        fi
    fi
    
    # Start Docker containers
    print_step "Starting Docker containers..."
    
    # Check if containers are already running
    if docker ps | grep -q "spring_backend\|PASAR_db"; then
        print_warning "Some containers are already running."
        read -p "Do you want to restart them? (y/N): " restart
        if [[ "$restart" =~ ^[Yy]$ ]]; then
            docker-compose down
            docker-compose up --build -d
        fi
    else
        docker-compose up --build -d
    fi
    
    print_success "Docker containers started"
    print_info "Backend API: http://localhost:8080"
    print_info "Database: localhost:5433"
    
    # Wait for backend to be ready
    print_step "Waiting for backend to be ready..."
    local max_attempts=30
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:8080/api/v1/products/all >/dev/null 2>&1; then
            print_success "Backend is ready!"
            break
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done
    echo ""
    
    if [ $attempt -gt $max_attempts ]; then
        print_warning "Backend may still be starting. Check logs with: docker-compose logs -f backend"
    fi
    
    # Install and start frontend
    install_frontend_deps
    
    print_header "Starting Frontend"
    print_info "Starting frontend development server..."
    print_info "Frontend will be available at: http://localhost:5173"
    echo ""
    print_info "Press Ctrl+C to stop the frontend server"
    print_info "To stop backend: cd Backend && docker-compose down"
    echo ""
    
    npm run dev
}

# Start without Docker (local)
start_local() {
    check_local_prerequisites
    check_prerequisites
    
    print_header "Starting Locally (without Docker)"
    
    # Database setup info
    print_header "Database Setup"
    echo "Make sure PostgreSQL is running and you have:"
    echo "  1. Created a database named 'PASAR'"
    echo "  2. Updated Backend/src/main/resources/application.properties with your credentials"
    echo "  3. Run the init.sql script: psql -U postgres -d PASAR -f Backend/Database/init.sql"
    echo ""
    read -p "Is your database configured? (y/N): " db_ready
    
    if [[ ! "$db_ready" =~ ^[Yy]$ ]]; then
        print_info "Please configure your database and run this script again."
        print_info "See README.md for detailed instructions."
        exit 0
    fi
    
    # Start backend
    print_header "Starting Backend"
    cd "$BACKEND_DIR"
    
    print_step "Starting Spring Boot backend..."
    print_info "Backend will start on http://localhost:8080"
    echo ""
    
    # Start backend in background
    if [ -f "./mvnw" ]; then
        chmod +x ./mvnw
        ./mvnw spring-boot:run &
    else
        mvn spring-boot:run &
    fi
    BACKEND_PID=$!
    
    # Wait for backend to start
    print_step "Waiting for backend to be ready..."
    local max_attempts=60
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:8080/api/v1/products/all >/dev/null 2>&1; then
            print_success "Backend is ready!"
            break
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done
    echo ""
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Backend failed to start. Check the logs above for errors."
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    # Install and start frontend
    install_frontend_deps
    
    print_header "Starting Frontend"
    print_info "Starting frontend development server..."
    print_info "Frontend will be available at: http://localhost:5173"
    echo ""
    print_info "Press Ctrl+C to stop both servers"
    echo ""
    
    # Trap to cleanup on exit
    cleanup() {
        echo ""
        print_info "Shutting down..."
        kill $BACKEND_PID 2>/dev/null
        print_success "Backend stopped"
        exit 0
    }
    trap cleanup SIGINT SIGTERM
    
    cd "$FRONTEND_DIR"
    npm run dev
    
    # If frontend exits, kill backend
    kill $BACKEND_PID 2>/dev/null
}

# Main menu
main() {
    clear
    echo -e "${CYAN}"
    echo "  ____   _    ____    _    ____  "
    echo " |  _ \ / \  / ___|  / \  |  _ \ "
    echo " | |_) / _ \ \___ \ / _ \ | |_) |"
    echo " |  __/ ___ \ ___) / ___ \|  _ < "
    echo " |_| /_/   \_\____/_/   \_\_| \_\\"
    echo -e "${NC}"
    echo "  E-commerce Platform Startup Script"
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo ""
    echo "How would you like to run the application?"
    echo ""
    echo -e "  ${GREEN}1)${NC} With Docker ${YELLOW}(Recommended)${NC}"
    echo "     - Automatically sets up PostgreSQL"
    echo "     - No local database configuration needed"
    echo ""
    echo -e "  ${GREEN}2)${NC} Without Docker (Local)"
    echo "     - Requires local PostgreSQL installation"
    echo "     - Requires Java 21 and Maven"
    echo ""
    echo -e "  ${GREEN}3)${NC} Frontend only"
    echo "     - Only starts the frontend dev server"
    echo "     - Assumes backend is already running"
    echo ""
    echo -e "  ${GREEN}4)${NC} Exit"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            start_with_docker
            ;;
        2)
            start_local
            ;;
        3)
            check_prerequisites
            install_frontend_deps
            print_header "Starting Frontend Only"
            print_info "Make sure the backend is running on http://localhost:8080"
            print_info "Frontend will be available at: http://localhost:5173"
            echo ""
            cd "$FRONTEND_DIR"
            npm run dev
            ;;
        4)
            print_info "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please enter 1, 2, 3, or 4."
            exit 1
            ;;
    esac
}

# Run main
main
