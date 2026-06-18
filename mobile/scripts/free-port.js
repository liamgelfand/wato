const { execSync } = require('child_process')

const port = process.argv[2] || '8081'

function freeWindows(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, { encoding: 'utf8' })
    const pids = new Set()

    for (const line of output.trim().split(/\r?\n/)) {
      if (!line.includes('LISTENING')) continue
      const parts = line.trim().split(/\s+/)
      const pid = parts[parts.length - 1]
      if (/^\d+$/.test(pid)) pids.add(pid)
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
        console.log(`Freed port ${targetPort} (pid ${pid})`)
      } catch {
        // already gone
      }
    }
  } catch {
    // port not in use
  }
}

function freeUnix(targetPort) {
  try {
    execSync(`lsof -ti tcp:${targetPort} | xargs kill -9`, { shell: true, stdio: 'ignore' })
    console.log(`Freed port ${targetPort}`)
  } catch {
    // port not in use
  }
}

if (process.platform === 'win32') freeWindows(port)
else freeUnix(port)
