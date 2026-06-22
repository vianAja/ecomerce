pipeline {
    agent any
    
    environment {
        STAGING_IP = '172.2.1.10'
        SSH_CRED = 'credentials-stg-server' 

    	IMAGES_NAME = 'webapps'
	    IMAGES_TAG = 'v1.1.1'

    	STAGING_USER = 'jenkins' 
        PROJECT_DIR = '/root/project/ecomerce'
	    PROJECT_DIR_STG = '/home/jenkins/ecomerce'

    	PRODUCTION_USER = 'jenkins'
    	PRODUCTION_IP = 'prod'
    	PROJECT_DIR_PROD = '/home/jenkins/ecomerce'
    	PROD_BRANCH = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }


        stage('Build Image (Local Jenkins)') {
            steps {
                script {
                    echo "Building Docker Image..."
                    sh "docker build -t ${IMAGES_NAME}:${IMAGES_TAG} ."
		    sh "docker inspect ${IMAGES_NAME}:${IMAGES_TAG}"
                }
            }
        }

	stage('Deploy to Staging Server') {
            steps {
                // Menggunakan SSH Agent untuk eksekusi remote
                sshagent(credentials: ["${SSH_CRED}"]) {
                    sh """
			ssh -o StrictHostKeyChecking=no ${STAGING_USER}@${STAGING_IP} '
                            rm -f ${PROJECT_DIR_STG}/.env || true

                            if [ ! -d ${PROJECT_DIR_STG} ]; then
                                echo "Folder belum ada. Melakukan Git Clone..."
                                git clone -b staging https://github.com/vianAja/ecomerce.git
                            else
                                echo "Folder sudah ada. Melakukan Git Pull paksa..."
                                cd ${PROJECT_DIR_STG}

                                git reset --hard origin/staging
                                git pull origin staging 
                            fi
                        '
                    """
		    withCredentials([file(credentialsId: 'staging-env-file', variable: 'SECRET_ENV')]) {
                        sh 'scp -o StrictHostKeyChecking=no \$SECRET_ENV ${STAGING_USER}@${STAGING_IP}:${PROJECT_DIR_STG}/.env'
                    }

                    sh """
                        ssh -o StrictHostKeyChecking=no ${STAGING_USER}@${STAGING_IP} '
                            cd ${PROJECT_DIR_STG}
                            docker compose down -v
                            docker compose up -d --build
			    sleep 60
			    docker compose ps -a
                        '
                    """
                }
            }
        }
	// --- MANUAL APPROVAL GATE ---
        stage('Approve Deployment') {
            steps {
                script {
                    input message: 'Staging sukses. Apakah Anda yakin ingin merilis ke PRODUCTION?', ok: 'Deploy ke Production'
                }
            }
        }

	stage('Deploy to Production Server') {
            steps {
                sshagent(credentials: ["${SSH_CRED}"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${PRODUCTION_USER}@${PRODUCTION_IP} '
			    rm -f ${PROJECT_DIR_PROD}/.env || true

			    if [ ! -d ${PROJECT_DIR_PROD} ]; then
                                git clone -b ${PROD_BRANCH} https://github.com/vianAja/ecomerce.git
                            else
                                cd ${PROJECT_DIR_PROD}
                                git pull origin ${PROD_BRANCH}
                            fi
                        '
                    """
                    withCredentials([file(credentialsId: 'production-env-file', variable: 'SECRET_ENV')]) {
                        sh 'scp -o StrictHostKeyChecking=no \$SECRET_ENV  ${PRODUCTION_USER}@${PRODUCTION_IP}:${PROJECT_DIR_PROD}/.env'
                    }

                    sh """
                        ssh -o StrictHostKeyChecking=no  ${PRODUCTION_USER}@${PRODUCTION_IP} '
                            cd ${PROJECT_DIR_PROD}
                            docker compose down -v
                            docker compose up -d --build
			    sleep 60
			    docker compose ps -a
                        '
                    """
                }
            }
        }
    }
}
