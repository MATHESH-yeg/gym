const { query } = require('../config/db');

// Start a workout session
const startSession = async (req, res) => {
    const { source, sourceId } = req.body; // source: 'ASSIGNED' or 'PERSONAL'
    const userId = req.user.id;

    try {
        const result = await query(
            'INSERT INTO workout_sessions (user_id, source, source_id) VALUES ($1, $2, $3) RETURNING *',
            [userId, source, sourceId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to start session' });
    }
};

// Log a set in a session
const logSet = async (req, res) => {
    const { sessionId } = req.params;
    const { exerciseName, setIndex, weight, reps, isCompleted } = req.body;

    try {
        // Verify session belongs to user
        const sessionCheck = await query('SELECT user_id FROM workout_sessions WHERE id = $1', [sessionId]);
        if (sessionCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to log in this session' });
        }

        const result = await query(
            'INSERT INTO workout_set_logs (session_id, exercise_name, set_index, weight, reps, is_completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [sessionId, exerciseName, setIndex, weight, reps, isCompleted]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to log set' });
    }
};

// Finish a session
const finishSession = async (req, res) => {
    const { sessionId } = req.params;
    const { notes, feelingRating } = req.body;

    try {
        const result = await query(
            'UPDATE workout_sessions SET end_time = CURRENT_TIMESTAMP, status = $1, notes = $2, feeling_rating = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            ['COMPLETED', notes, feelingRating, sessionId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to finish session' });
    }
};

module.exports = { startSession, logSet, finishSession };
