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
    stage('Set up infrastructure') {
        steps {
            build 'NLInfrastructure/NLDeploy'
        }
    }
    stage('Pull latest version of Project from Git') {
      steps {
          git(branch: 'develop', url: 'https://github.com/paulsbruce/neoload_68.git', credentialsId: 'github-paulsbruce')
      }
    }

    stage('Define Dynamic Population') {
      steps {
        // create a dynamic sanity scenario
        writeFile file: "${env.WORKSPACE}/eux-scenario.yaml", text: """
scenarios:
- name: MixedScenarioWithEUX
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
  - name: dynatracePop
    constant_load:
      duration: ${env.TEST_DURATION}
      users: 1
  - name: popSelenium
    rampup_load:
      duration: ${env.TEST_DURATION}
      min_users: 1
      max_users: ${env.EUX_THREADS}
      increment_users: 1
      increment_every: 20s
      """
        writeFile file: "${env.WORKSPACE}/eux-no-apm.yaml", text: """
scenarios:
- name: MixedScenarioEUXNoAPM
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
                sh """/usr/local/neoload/bin/NeoLoadCmd \
-project '${env.WORKSPACE}/demo.nlp' '${env.WORKSPACE}/demo-mixed.yaml' '${env.WORKSPACE}/eux-no-apm.yaml' \
-launch MixedScenarioEUXNoAPM \
-testResultName 'Load Test w/ APM (build ${BUILD_NUMBER})' \
-description 'Based on demo-mixed.yaml' \
-NTS http://nts:8080/nts \
-NTSLogin admin:con+DjJ+R3s9j9d1qKQFGA== \
-leaseLicense MCwCFFBs4Jbl0o4HiLd/f7CPnzQ/44TZAhR+6PlJPK7XdmYtka+AHWxn0j2QLg==:50:1 \
-report ${env.WORKSPACE}/neoload-report/neoload-report.html,${env.WORKSPACE}/neoload-report/sanity-report.xml \
-SLAJUnitResults ${env.WORKSPACE}/neoload-report/sanity-junit-sla-results.xml \
-noGUI -nlweb \
-variables ControllerAPIHostAndPort=10.0.0.10:7400,TargetHostBaseUrl=http://10.0.0.10,SeleniumHubHostAndPort=10.0.0.15:4444 \
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
  }
  post {
      always {
          build 'NLInfrastructure/NLShutdown'
          archiveArtifacts 'neoload-report/**'
          junit allowEmptyResults: true, testResults: 'neoload-report/junit*.xml'
      }
  }
}
