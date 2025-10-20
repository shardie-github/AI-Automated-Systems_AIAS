#!/bin/bash

# AIAS Consultancy Deployment Script
# This script handles the complete deployment process for the AIAS platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
APP_NAME="aias-consultancy"
DOCKER_REGISTRY="your-registry.com"
VERSION=${2:-$(git rev-parse --short HEAD)}

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if required environment variables are set
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable is not set."
    fi
    
    if [ -z "$VITE_SUPABASE_URL" ]; then
        error "VITE_SUPABASE_URL environment variable is not set."
    fi
    
    if [ -z "$VITE_STRIPE_PUBLISHABLE_KEY" ]; then
        error "VITE_STRIPE_PUBLISHABLE_KEY environment variable is not set."
    fi
    
    success "Prerequisites check passed"
}

# Build the application
build_app() {
    log "Building application..."
    
    # Install dependencies
    log "Installing dependencies..."
    npm ci --only=production
    
    # Run type checking
    log "Running type checking..."
    npm run typecheck
    
    # Run linting
    log "Running linting..."
    npm run lint
    
    # Run tests
    log "Running tests..."
    npm run test -- --run
    
    # Build the application
    log "Building application..."
    npm run build
    
    success "Application built successfully"
}

# Build Docker image
build_docker() {
    log "Building Docker image..."
    
    # Build the Docker image
    docker build -t ${APP_NAME}:${VERSION} .
    docker build -t ${APP_NAME}:latest .
    
    # Tag for registry
    docker tag ${APP_NAME}:${VERSION} ${DOCKER_REGISTRY}/${APP_NAME}:${VERSION}
    docker tag ${APP_NAME}:latest ${DOCKER_REGISTRY}/${APP_NAME}:latest
    
    success "Docker image built successfully"
}

# Push to registry
push_docker() {
    log "Pushing Docker image to registry..."
    
    # Login to registry (assuming credentials are set)
    docker login ${DOCKER_REGISTRY}
    
    # Push images
    docker push ${DOCKER_REGISTRY}/${APP_NAME}:${VERSION}
    docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest
    
    success "Docker image pushed successfully"
}

# Deploy to environment
deploy() {
    log "Deploying to ${ENVIRONMENT} environment..."
    
    # Create environment-specific compose file
    if [ "$ENVIRONMENT" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f ${COMPOSE_FILE} down
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose -f ${COMPOSE_FILE} pull
    
    # Start services
    log "Starting services..."
    docker-compose -f ${COMPOSE_FILE} up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check health
    check_health
    
    success "Deployment completed successfully"
}

# Check application health
check_health() {
    log "Checking application health..."
    
    # Wait for application to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            success "Application is healthy"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    error "Application health check failed after $max_attempts attempts"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations
    docker-compose exec -T app npm run db:migrate
    
    success "Database migrations completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring directories
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    
    # Copy monitoring configurations
    cp -r monitoring/* monitoring/grafana/dashboards/ 2>/dev/null || true
    
    success "Monitoring setup completed"
}

# Generate SSL certificates (for production)
generate_ssl() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Generating SSL certificates..."
        
        # Create SSL directory
        mkdir -p ssl
        
        # Generate self-signed certificate for development
        # In production, you would use Let's Encrypt or a proper CA
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=AIAS/CN=aias-consultancy.com"
        
        success "SSL certificates generated"
    fi
}

# Backup database
backup_database() {
    log "Creating database backup..."
    
    # Create backup directory
    mkdir -p backups
    
    # Create backup
    docker-compose exec -T postgres pg_dump -U aias_user aias_production > backups/backup_$(date +%Y%m%d_%H%M%S).sql
    
    success "Database backup created"
}

# Cleanup old resources
cleanup() {
    log "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting AIAS Consultancy deployment..."
    log "Environment: ${ENVIRONMENT}"
    log "Version: ${VERSION}"
    
    # Run deployment steps
    check_prerequisites
    build_app
    build_docker
    
    if [ "$ENVIRONMENT" = "production" ]; then
        push_docker
        generate_ssl
        backup_database
    fi
    
    setup_monitoring
    deploy
    run_migrations
    
    if [ "$ENVIRONMENT" = "production" ]; then
        cleanup
    fi
    
    success "Deployment completed successfully!"
    log "Application is available at: http://localhost:3000"
    log "Monitoring dashboard: http://localhost:3001"
    log "API documentation: http://localhost:3000/api/docs"
}

# Handle script arguments
case "${1:-}" in
    "build")
        check_prerequisites
        build_app
        build_docker
        ;;
    "deploy")
        main
        ;;
    "health")
        check_health
        ;;
    "backup")
        backup_database
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {build|deploy|health|backup|cleanup} [environment] [version]"
        echo "  build     - Build the application and Docker image"
        echo "  deploy    - Deploy the application (default: staging)"
        echo "  health    - Check application health"
        echo "  backup    - Create database backup"
        echo "  cleanup   - Clean up old resources"
        echo ""
        echo "Environments: staging, production"
        echo "Example: $0 deploy production v1.0.0"
        exit 1
        ;;
esac