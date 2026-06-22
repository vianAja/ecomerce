pipeline {
    agent any
    
    environment {
        STAGING_IP = '172.2.1.10'
        SSH_CRED = 'credentials-stg-server' 
	STAGING_USER = 'jenkins' 
        PROJECT_DIR = '/root/project/ecomerce'

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
		    sh "id"
		    sh "hostname && ip a"
                    sh "docker build -t my-app:staging ."
                }
            }
        }

	stage('Deploy to Staging Server') {
            steps {
                // Menggunakan SSH Agent untuk eksekusi remote
                sshagent(credentials: ["${SSH_CRED}"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${STAGING_USER}@${STAGING_IP} '
                            cd ${PROJECT_DIR} &&
                            git pull origin staging &&
                            docker-compose down &&
                            docker-compose up -d --build
                        '
                    """
                }
            }
        }
    }
}
