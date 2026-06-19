pipeline {
    // Menjalankan pipeline di dalam container Docker (Docker-in-Docker)
    agent {
        docker {
            image 'docker:dind'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    
    environment {
        STAGING_IP = '172.10.10.1'
        // 'staging-ssh-key' adalah ID dari credentials yang dibuat di dashboard Jenkins
        SSH_CRED = 'staging-ssh-key' 
        PROJECT_DIR = '/path/to/your/project'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Image') {
            steps {
                script {
                    echo "Building Docker Image..."
                    sh "docker build -t my-app:staging ."
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                // Menggunakan SSH Agent untuk masuk ke server staging
                sshagent(credentials: ["${SSH_CRED}"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no user@${STAGING_IP} '
                            cd ${PROJECT_DIR} &&
                            git pull origin main &&
                            docker-compose down &&
                            docker-compose up -d --build
                        '
                    """
                }
            }
        }
    }
}
