const { query } = require('../config/db');

// Create an assigned workout (Trainers/Admins)
const createAssignedWorkout = async (req, res) => {
    const { memberId, name, routineCode, structure } = req.body;
    const trainerId = req.user.id;
    const brandId = req.user.brand_id;

    try {
        const result = await query(
            'INSERT INTO assigned_workouts (brand_id, created_by, assigned_to, name, routine_code, structure) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [brandId, trainerId, memberId, name, routineCode, structure]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create assigned workout' });
    }
};

// Create a personal plan (Members)
const createPersonalPlan = async (req, res) => {
    const { name, structure } = req.body;
    const userId = req.user.id;

    try {
        const result = await query(
            'INSERT INTO workout_plans (user_id, name, structure) VALUES ($1, $2, $3) RETURNING *',
            [userId, name, structure]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create personal plan' });
    }
};

// Get today's assigned workout for member
const getMyAssignedWorkouts = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await query(
            'SELECT * FROM assigned_workouts WHERE assigned_to = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
};

module.exports = { createAssignedWorkout, createPersonalPlan, getMyAssignedWorkouts };
