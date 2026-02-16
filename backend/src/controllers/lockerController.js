const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const assignLocker = async (req, res) => {
    const { student_id, items } = req.body;

    try {
        // 1. Check if student already has an active assignment
        const { data: existingAssignment, error: checkError } = await supabase
            .from('locker_assignments')
            .select('id')
            .eq('student_id', student_id)
            .eq('status', 'active')
            .single();

        if (existingAssignment) {
            return res.status(400).json({ error: 'Student already has an active locker assignment.' });
        }

        // 2. Find an available locker
        const { data: availableLocker, error: lockerError } = await supabase
            .from('lockers')
            .select('id, locker_number')
            .eq('status', 'available')
            .limit(1)
            .maybeSingle();

        if (!availableLocker) {
            return res.status(404).json({ error: 'No lockers available.' });
        }

        // 3. Generate password
        const password = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Create assignment
        const { data: assignment, error: assignError } = await supabase
            .from('locker_assignments')
            .insert([
                {
                    student_id,
                    locker_id: availableLocker.id,
                    password,
                    status: 'active'
                }
            ])
            .select()
            .single();

        if (assignError) throw assignError;

        // 5. Update locker status
        const { error: updateError } = await supabase
            .from('lockers')
            .update({ status: 'occupied' })
            .eq('id', availableLocker.id);

        if (updateError) throw updateError;

        // 6. Store items
        if (items && items.length > 0) {
            const itemsToInsert = items.map(item => ({
                assignment_id: assignment.id,
                item_type: item.item_type,
                model: item.model,
                color: item.color,
                notes: item.notes
            }));

            const { error: itemsError } = await supabase
                .from('stored_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;
        }

        res.status(201).json({
            message: 'Locker assigned successfully',
            locker_number: availableLocker.locker_number,
            password,
            assignment_id: assignment.id
        });

    } catch (error) {
        console.error('Error assigning locker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const returnLocker = async (req, res) => {
    const { student_id, locker_number } = req.body;

    try {
        // 1. Find active assignment matching student and locker
        const { data: assignment, error: fetchError } = await supabase
            .from('locker_assignments')
            .select(`
            id,
            locker_id,
            lockers!inner(locker_number)
        `)
            .eq('student_id', student_id)
            .eq('status', 'active')
            .eq('lockers.locker_number', locker_number)
            .single();

        if (!assignment) {
            return res.status(404).json({ error: 'Active assignment not found for this student and locker.' });
        }

        // 2. Update assignment status
        const { error: updateAssignmentError } = await supabase
            .from('locker_assignments')
            .update({ status: 'returned', returned_at: new Date().toISOString() })
            .eq('id', assignment.id);

        if (updateAssignmentError) throw updateAssignmentError;

        // 3. Update locker status
        const { error: updateLockerError } = await supabase
            .from('lockers')
            .update({ status: 'available' })
            .eq('id', assignment.locker_id);

        if (updateLockerError) throw updateLockerError;

        res.json({ message: 'Locker returned successfully.' });

    } catch (error) {
        console.error('Error returning locker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getLockerStatus = async (req, res) => {
    try {
        const { data: lockers, error } = await supabase
            .from('lockers')
            .select('*')
            .order('locker_number', { ascending: true });

        if (error) throw error;

        res.json(lockers);
    } catch (error) {
        console.error('Error fetching locker status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMyAssignment = async (req, res) => {
    const { student_id } = req.query;

    if (!student_id) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    try {
        const { data: assignment, error } = await supabase
            .from('locker_assignments')
            .select(`
                id,
                locker_id,
                password,
                assigned_at,
                lockers (locker_number),
                stored_items (item_type, model, color)
            `)
            .eq('student_id', student_id)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;

        if (!assignment) {
            return res.json(null);
        }

        res.json(assignment);
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addItem = async (req, res) => {
    const { student_id, item_type, model, color, notes } = req.body;

    if (!student_id || !item_type) {
        return res.status(400).json({ error: 'Student ID and Item Type are required' });
    }

    try {
        // 1. Find active assignment matching student
        const { data: assignment, error: fetchError } = await supabase
            .from('locker_assignments')
            .select('id')
            .eq('student_id', student_id)
            .eq('status', 'active')
            .single();

        if (fetchError || !assignment) {
            return res.status(404).json({ error: 'Active assignment not found for this student.' });
        }

        // 2. Insert item into stored_items
        const { data: newItem, error: insertError } = await supabase
            .from('stored_items')
            .insert([
                {
                    assignment_id: assignment.id,
                    item_type,
                    model,
                    color,
                    notes
                }
            ])
            .select()
            .single();

        if (insertError) throw insertError;

        res.status(201).json({ message: 'Item added successfully', item: newItem });

    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addItems = async (req, res) => {
    const { student_id, items } = req.body;

    if (!student_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Student ID and a list of items are required' });
    }

    try {
        // 1. Find active assignment matching student
        const { data: assignment, error: fetchError } = await supabase
            .from('locker_assignments')
            .select('id')
            .eq('student_id', student_id)
            .eq('status', 'active')
            .single();

        if (fetchError || !assignment) {
            return res.status(404).json({ error: 'Active assignment not found for this student.' });
        }

        // 2. Prepare items for insertion
        const itemsToInsert = items.map(item => ({
            assignment_id: assignment.id,
            item_type: item.item_type,
            model: item.model,
            color: item.color,
            notes: item.notes
        }));

        // 3. Insert items into stored_items
        const { data: newItems, error: insertError } = await supabase
            .from('stored_items')
            .insert(itemsToInsert)
            .select();

        if (insertError) throw insertError;

        res.status(201).json({ message: 'Items added successfully', items: newItems });

    } catch (error) {
        console.error('Error adding items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getLockerStatusAdmin = async (req, res) => {
    try {
        // 1. Fetch lockers with active assignments
        const { data: lockers, error } = await supabase
            .from('lockers')
            .select(`
                *,
                locker_assignments(student_id, status)
            `)
            .order('locker_number', { ascending: true });

        if (error) throw error;

        // 2. Extract student IDs from active assignments
        const activeAssignments = lockers.flatMap(l =>
            l.locker_assignments.filter(a => a.status === 'active')
        );

        const studentIds = [...new Set(activeAssignments.map(a => a.student_id))];

        // 3. Fetch user details from Clerk
        const clerksdk = require('@clerk/clerk-sdk-node');
        let users = [];
        if (studentIds.length > 0) {
            try {
                users = await clerksdk.users.getUserList({ userId: studentIds, limit: 100 });
            } catch (clerkError) {
                console.error("Clerk fetch error:", clerkError);
                // Fallback: don't fail the whole request, just show no names
            }
        }

        const userMap = users.reduce((acc, user) => {
            acc[user.id] = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown';
            return acc;
        }, {});

        // 4. Merge data
        const enrichedLockers = lockers.map(locker => {
            const activeAssign = locker.locker_assignments.find(a => a.status === 'active');
            let assigned_to = null;
            if (activeAssign) {
                assigned_to = userMap[activeAssign.student_id] || 'Loading...';
            }
            return {
                ...locker,
                assigned_to,
                locker_assignments: undefined // Clean up
            };
        });

        res.json(enrichedLockers);
    } catch (error) {
        console.error('Error fetching admin locker status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    assignLocker,
    returnLocker,
    getLockerStatus,
    getLockerStatusAdmin,
    getMyAssignment,
    addItem,
    addItems
};
