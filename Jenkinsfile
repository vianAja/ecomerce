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

        stage('Deploy to Staging') {
            steps {
                script {
                    // 1. Definisikan konfigurasi server remote
                    def remote = [:]
                    remote.name = 'staging-server'
                    remote.host = env.STAGING_IP
                    remote.user = env.STAGING_USER
                    remote.allowAnyHosts = true // Setara dengan StrictHostKeyChecking=no

                    // 2. Ambil Private Key dari Jenkins Credentials
                    withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CRED, keyFileVariable: 'identity', passphraseVariable: '', usernameVariable: '')]) {
                        remote.identityFile = identity
                        
                        // 3. Jalankan perintah di server staging
                        echo "Menghubungkan ke ${remote.host}..."
                        sshCommand remote: remote, command: """
                            cd ${PROJECT_DIR} &&
                            git pull origin staging &&
                            docker-compose down &&
                            docker-compose up -d --build
                        """
                    }
                }
            }
        }
    }
}
