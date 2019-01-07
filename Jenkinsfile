pipeline {
  agent {
    node {
      label 'docker-neoload-68'
    }
  }
  environment {
    WORKSPACE = pwd()
    TEST_DURATION = '10m'
    EUX_THREADS = 2
  }
  stages {
    stage('Pull latest version of Project from Git') {
      steps {
          git(branch: 'develop', url: 'https://github.com/paulsbruce/neoload_68.git', credentialsId: 'github-paulsbruce')
      }
    }
    stage('Set up infrastructure') {
        steps {
            build 'NLInfrastructure/NLDeploy'
        }
    }
    stage('Define Dynamic Scenario') {
      steps {
        // create a dynamic sanity scenario
        writeFile file: "${env.WORKSPACE}/eux-and-apm.yaml", text: """
scenarios:
- name: dynMixedScenarioEUXwAPM
  populations:
  - name: API
    rampup_load:
      duration: ${env.TEST_DURATION}
      min_users: 1
      max_users: 5
      increment_users: 1
      increment_every: 10s
  - name: popPost
    rampup_load:
      duration: ${env.TEST_DURATION}
      min_users: 1
      max_users: 15
      increment_users: 1
      increment_every: 15s
#  - name: dynatracePop
#    constant_load:
#      duration: ${env.TEST_DURATION}
#      users: 1
  - name: popSelenium
    rampup_load:
      duration: ${env.TEST_DURATION}
      min_users: 1
      max_users: ${env.EUX_THREADS}
      increment_users: 1
      increment_every: 20s
      """
      }
    }

    stage('Main pipeline') {
      parallel {
        stage('NeoLoad Test') {
            steps {
                script {
                    neoloadRun project: "${env.WORKSPACE}/demo.nlp",
                        scenario: "dynMixedScenarioEUXwAPM",
                        testName: "Load Test w/ APM (build ${BUILD_NUMBER})",
                        testDescription: "Based on demo-mixed.yaml",
                        reportXml: "${env.WORKSPACE}/neoload-report/sanity-report.xml",
                        reportHtml: "${env.WORKSPACE}/neoload-report/neoload-report.html",
                        reportJunit: "${env.WORKSPACE}/neoload-report/sanity-junit-sla-results.xml",
                        trendGraphs: ['AvgResponseTime', 'ErrorRate'],
                        commandLineOption: """-nlweb -variables \
                        ControllerAPIHostAndPort=10.0.0.10:7400,\
                        TargetHostBaseUrl=http://10.0.0.10,\
                        SeleniumHubHostAndPort=10.0.0.15:4444 \
                         -project ${env.WORKSPACE}/demo-mixed.yaml \
                         -project ${env.WORKSPACE}/eux-and-apm.yaml
                        """,
                        sharedLicense: [
                            server: 'NeoLoad Demo License',
                            duration: 1,
                            vuCount: 50
                        ]
                }
            }
        }
        stage('While Test Running')
        {
          steps {
            sh """
              echo
              echo --- Dynatrace Dashboard ---
              echo "https://vwv51099.live.dynatrace.com/#dashboard;id=b832b009-8a4d-45fa-8488-33214bf07443;gtf=l_30_MINUTES"
              echo ---
              """
          }
        }
      }
    }
    stage('Archive Artifacts') {
        steps {
          archiveArtifacts 'neoload-report/**'
          junit allowEmptyResults: true, testResults: 'neoload-report/junit*.xml'
        }
    }
  }
  post {
      always {
          build 'NLInfrastructure/NLShutdown'
      }
  }
}
