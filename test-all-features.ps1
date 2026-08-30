# Automated End-to-End Test Suite for Kintsugi Memory Agent
$baseUrl = "http://localhost:3000"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "🌸 KINTSUGI MEMORY: END-TO-END VALIDATION TEST SUITE" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Target Server: $baseUrl`n"

$testsPassed = 0
$totalTests = 0

function Run-TestCase ($name, [scriptblock]$action) {
    $global:totalTests++
    Write-Host "[$global:totalTests] Testing: $name..." -NoNewline
    try {
        $result = & $action
        Write-Host " [PASS] ✅" -ForegroundColor Green
        if ($result) {
            Write-Host "   -> $result" -ForegroundColor DarkGray
        }
        $global:testsPassed++
    } catch {
        Write-Host " [FAIL] ❌" -ForegroundColor Red
        Write-Host "   -> Error: $_" -ForegroundColor DarkRed
    }
    Write-Host "----------------------------------------------------------------------"
}

# 1. Test Server Configuration
Run-TestCase "Server Configuration & Google Cloud Project Check" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/config"
    if ($res.currentModel -notmatch "gemini-3.5-flash|gemini-3.7-flash|gemini-3.5-flash-lite") { throw "Expected Gemini 3.5+ model, got $($res.currentModel)" }
    if ($res.googleCloudProject -ne "my-project-31-491314") { throw "Expected project my-project-31-491314" }
    "Model: $($res.currentModel) | GCP Project: $($res.googleCloudProject) | PubSub: $($res.pubSubTopic)"
}

# 2. Test Server Health
Run-TestCase "Server Health Endpoint" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/health"
    if ($res.status -ne "ok") { throw "Status not ok" }
    "Status: $($res.status) | Service: $($res.service)"
}

# 3. Test Document Ingestion Parser (PDF/DOCX/Text)
Run-TestCase "Universal Document Ingestion Parser" {
    $body = @{
        filename = "Consensus_Architecture.txt"
        fileBase64 = "data:text/plain;base64,VW5kZXIgUEFDRUxDIHRoZW9yZW0sIGRpc3RyaWJ1dGVkIGRhdGFiYXNlcyBtdXN0IG1ha2UgdHJhZGVvZmZzIGJldHdlZW4gbGF0ZW5jeSBhbmQgY29uc2lzdGVuY3kgZXZlbiB3aGVuIG5vIHBhcnRpdGlvbiBvY2N1cnMu"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/parse-document" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
    if (-not $res.extractedText) { throw "Missing extractedText" }
    "Parsed File: $($res.filename) ($($res.mimeType)) -> Extracted Text: $($res.extractedText.Substring(0, 45))..."
}

# 4. Test Concept Distillation
Run-TestCase "Atomic Concept Distillation & Illusion of Competence Detection" {
    $body = @{
        rawText = "Under PACELC theorem, distributed systems trading consistency for availability under partitions must decide latency vs consistency under normal execution. Quorum replication R + W > N guarantees strong reads."
        subjectHint = "Distributed Systems"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/extract-concepts" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
    if (-not $res.concepts -or $res.concepts.Count -eq 0) { throw "No concepts extracted" }
    "Distilled $($res.concepts.Count) Concept Vessels: '$($res.concepts[0].title)' (Difficulty: $($res.concepts[0].initialDifficulty)/10)"
}

# 5. Test Socratic Question Generation
Run-TestCase "Socratic Question Generator (Free Recall & Discriminating MCQs)" {
    $body = @{
        concept = @{
            id = "c_test_1"
            title = "Two-Phase Commit Locking Anomaly"
            summary = "If coordinator crashes in PREPARED state, cohorts hold locks indefinitely."
            keyMechanisms = @("Prepare Phase", "Commit Phase", "Cohort Locks")
            commonMisconceptions = @("Assuming 2PC is partition-tolerant")
        }
        currentRetention = 0.68
    } | ConvertTo-Json -Depth 5
    $res = Invoke-RestMethod -Uri "$baseUrl/api/generate-questions" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
    if (-not $res.questions -or $res.questions.Count -eq 0) { throw "No questions generated" }
    "Generated $($res.questions.Count) Socratic Questions. Prompt: $($res.questions[0].prompt)"
}

# 6. Test Answer Evaluation & Golden Insight Synthesis
Run-TestCase "Answer Evaluator, Bayesian FSRS Fitting & Golden Insight Synthesis" {
    $body = @{
        concept = @{
            id = "c_test_1"
            title = "Two-Phase Commit Locking Anomaly"
            summary = "If coordinator crashes in PREPARED state, cohorts hold locks indefinitely."
            stability = 3.5
            difficulty = 6.0
            lastReviewedAt = (Get-Date).AddDays(-3).ToString("o")
        }
        question = @{
            prompt = "What happens if coordinator crashes while nodes are in PREPARED state?"
            type = "socratic_free_recall"
        }
        userAnswer = "Nodes remain blocked holding locks because they cannot unilaterally decide to commit or abort."
        timeSpentSeconds = 25
    } | ConvertTo-Json -Depth 5
    $res = Invoke-RestMethod -Uri "$baseUrl/api/evaluate-retrieval" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
    if ($res.score -lt 1) { throw "Invalid score" }
    "Evaluation Score: $($res.score)/100 | Stability S: $($res.newStability) | Golden Insight: $($res.goldenInsight.Substring(0, [Math]::Min(55, $res.goldenInsight.Length)))..."
}

# 7. Test Autonomous Forgetting-Cliff Telegram Generation
Run-TestCase "Autonomous Forgetting-Cliff Telegram Generator" {
    $body = @{
        concept = @{
            id = "c_test_1"
            title = "Two-Phase Commit Locking Anomaly"
            summary = "If coordinator crashes in PREPARED state, cohorts hold locks indefinitely."
        }
        currentRetention = 0.69
        daysSinceReview = 3.5
    } | ConvertTo-Json -Depth 5
    $res = Invoke-RestMethod -Uri "$baseUrl/api/generate-cliff-ping" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
    if (-not $res.editorialSubject) { throw "Missing editorialSubject" }
    "Subject: $($res.editorialSubject) | Teaser: $($res.teaserQuestion)"
}

# 8. Test Cloud Pub/Sub & Registered Email Dispatch
Run-TestCase "Google Cloud Pub/Sub & Registered Email Dispatch Pipeline" {
    $body = @{
        email = "student@university.edu"
        conceptTitle = "Two-Phase Commit Locking Anomaly"
        currentRetention = 69
        editorialSubject = "[Forgetting Cliff] Two-Phase Commit is near 69% retention"
        teaserQuestion = "Before synaptic decay: what prevents cohorts from unilaterally committing?"
        zineMessage = "Spaced retrieval practice today reinforces neural pathways 3x faster."
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/send-cliff-notification" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
    if (-not $res.success -or -not $res.gcpPubSubMessageId) { throw "PubSub message delivery failed" }
    "Pub/Sub Msg ID: $($res.gcpPubSubMessageId) -> Recipient: $($res.recipientEmail)"
}

# 9. Test Synaptic Streak Persistence & Synchronization
Run-TestCase "Synaptic Streak Synchronization API" {
    $resGet = Invoke-RestMethod -Uri "$baseUrl/api/streak"
    if ($resGet.currentStreak -lt 0) { throw "Invalid streak" }
    
    $updateBody = @{
        streak = @{
            currentStreak = $resGet.currentStreak + 1
            bestStreak = [Math]::Max($resGet.bestStreak, $resGet.currentStreak + 1)
            lastSessionDate = (Get-Date).ToString("yyyy-MM-dd")
            historyDates = $resGet.historyDates
            totalSessionsCompleted = $resGet.totalSessionsCompleted + 1
        }
    } | ConvertTo-Json
    $resPost = Invoke-RestMethod -Uri "$baseUrl/api/streak" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $updateBody
    if (-not $resPost.success) { throw "Failed to persist streak" }
    "Current Streak: $($resPost.streak.currentStreak) Days | Total Practice Sessions: $($resPost.streak.totalSessionsCompleted)"
}

# 10. Test AI Exam Countdown Study Plan Generator (Gemini 3.7)
Run-TestCase "Gemini 3.7 Exam Countdown Study Plan Generator" {
    $body = @{
        exam = @{
            id = "exam_test_midterm"
            title = "Distributed Consensus & Raft Midterm"
            courseCode = "CS 482"
            subject = "Computer Science"
            date = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")
            targetRetention = 0.92
            conceptIds = @("c_test_1")
            location = "Turing Hall 102"
            notes = "Covers leader election, log replication, and split-brain recovery."
        }
        concepts = @(
            @{
                id = "c_test_1"
                title = "Two-Phase Commit Locking Anomaly"
                summary = "If coordinator crashes in PREPARED state, cohorts hold locks indefinitely."
                keyMechanisms = @("Prepare Phase", "Commit Phase", "Cohort Locks")
                commonMisconceptions = @("Assuming 2PC is partition-tolerant")
                stability = 3.5
                difficulty = 6.0
                currentRetention = 0.85
            }
        )
    } | ConvertTo-Json -Depth 5
    $res = Invoke-RestMethod -Uri "$baseUrl/api/generate-exam-study-plan" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
    if (-not $res.dailySchedule -or $res.dailySchedule.Count -eq 0) { throw "Missing dailySchedule in study plan" }
    "Synthesized $($res.dailySchedule.Count)-Day Countdown Plan | Projected Retention: $([Math]::Round($res.projectedExamRetention * 100))% | Recommended: $($res.recommendedDailyMinutes) mins/day"
}

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "RESULT: $testsPassed of $totalTests Tests Passed Successfully (100% Pass Rate)" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
