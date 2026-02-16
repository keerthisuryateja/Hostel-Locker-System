const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Get all lockers with their current active assignment details
const getAllLockers = async (req, res) => {
    try {
        const { data: lockers, error } = await supabase
            .from('lockers')
            .select(`
                *,
                locker_assignments(
                    id,
                    student_id,
                    assigned_at,
                    returned_at, 
                    status,
                    stored_items(item_type, model)
                )
            `)
            .order('locker_number', { ascending: true });

        if (error) throw error;

        // Transform data to make it easier for frontend (only include active assignment)
        const formattedLockers = lockers.map(locker => {
            const activeAssignment = locker.locker_assignments.find(a => !a.returned_at) || null;
            return {
                ...locker,
                active_assignment: activeAssignment
            };
        });

        res.json(formattedLockers);
    } catch (error) {
        console.error('Error fetching all lockers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Force release a locker (Manual Return)
const forceReleaseLocker = async (req, res) => {
    const { locker_id } = req.body;

    try {
        // 1. Find active assignment for this locker
        const { data: assignment, error: findError } = await supabase
            .from('locker_assignments')
            .select('id')
            .eq('locker_id', locker_id)
            .eq('status', 'active')
            .maybeSingle();

        if (findError) throw findError;

        if (assignment) {
            // 2. Mark assignment as returned
            const { error: updateAssignmentError } = await supabase
                .from('locker_assignments')
                .update({ status: 'returned', returned_at: new Date().toISOString() })
                .eq('id', assignment.id);

            if (updateAssignmentError) throw updateAssignmentError;
        }

        // 3. Mark locker as available
        const { error: updateLockerError } = await supabase
            .from('lockers')
            .update({ status: 'available' })
            .eq('id', locker_id);

        if (updateLockerError) throw updateLockerError;

        res.json({ message: 'Locker force released successfully.' });

    } catch (error) {
        console.error('Error force releasing locker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Manually update locker status (e.g. for maintenance)
const updateLockerStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'available', 'occupied', 'maintenance' (if supported enum)

    // Note: If you change to 'available' manually without ending assignment, it might cause data inconsistency.
    // Ideally, UI should warn or handle this.

    try {
        const { error } = await supabase
            .from('lockers')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Locker status updated successfully.' });
    } catch (error) {
        console.error('Error updating locker status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllLockers,
    forceReleaseLocker,
    updateLockerStatus
};
