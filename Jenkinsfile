pipeline {
  agent {
    node {
      label 'docker-neoload-68'
    }
  }
  environment {
    WORKSPACE = pwd()
  }
  stages {
    stage('Set up infrastructure') {
        steps {
            build 'NLInfrastructure/NLDeploy'
        }
    }
    stage('Pull latest version of Project from Git') {
      steps {
          git(branch: 'develop', url: 'https://github.com/paulsbruce/neoload_68.git', credentialsId: 'paulsbruce-git-creds')
      }
    }

    stage('Main pipeline') {
      parallel {
        stage('NeoLoad Test') {
            steps { // wget -q -O - http://169.254.169.254/latest/meta-data/local-ipv4 // -> 10.0.0.10
                sh """/usr/local/neoload/bin/NeoLoadCmd \
-project '${env.WORKSPACE}/demo.nlp' '${env.WORKSPACE}/demo-mixed.yaml' \
-launch MixedScenarioWithMonitoring \
-testResultName 'Load Test w/ APM (build ${BUILD_NUMBER})' \
-description 'Based on demo-mixed.yaml' \
-NTS http://nts:8080/nts \
-NTSLogin admin:con+DjJ+R3s9j9d1qKQFGA== \
-leaseLicense MCwCFFBs4Jbl0o4HiLd/f7CPnzQ/44TZAhR+6PlJPK7XdmYtka+AHWxn0j2QLg==:50:1 \
-report ${env.WORKSPACE}/neoload-report/neoload-report.html,${env.WORKSPACE}/neoload-report/sanity-report.xml \
-SLAJUnitResults ${env.WORKSPACE}/neoload-report/sanity-junit-sla-results.xml \
-noGUI -nlweb \
-variables TargetHostBaseUrl=http://10.0.0.10,SeleniumHubHostAndPort=10.0.0.10:4444 \
                            """
            /*
            neoloadRun project: "$WORKSPACE/neoload_basic.nlp $WORKSPACE/dynamic_scenario.yaml",
                    scenario: 'SmokeScenario',
                    testName: 'Demo scnPost (build ${BUILD_NUMBER})',
                    testDescription: 'Demonstration load test',
                    commandLineOption: """-nlweb
                    """,
                    sharedLicense: [
                        server: 'NeoLoad Demo License',
                        duration: 1,
                        vuCount: 50
                    ]
            */
        }
        stage('While Test Running')
        {
          steps {
            sh """
              echo *** Dynatrace Dashboard ***
              echo "https://vwv51099.live.dynatrace.com/#dashboard;id=b832b009-8a4d-45fa-8488-33214bf07443;gtf=l_30_MINUTES"
              echo ***
              """
          }
        }
      }
    }
  }
  post {
      always {
          build 'NLInfrastructure/NLShutdown'
          archiveArtifacts 'neoload-report/**'
          junit allowEmptyResults: true, testResults: 'neoload-report/junit*.xml'
      }
  }
}
