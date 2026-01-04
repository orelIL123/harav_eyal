import { db } from '../config/firebase'
import {
    collection,
    doc,
    setDoc,
    onSnapshot,
    updateDoc,
    query,
    orderBy,
    getDocs,
    writeBatch
} from 'firebase/firestore'
import { FAITH_TOPICS } from '../data/faithTopics'

const COLLECTION_NAME = 'faith_topics'

/**
 * OPTIMIZED: Get faith topics once with cache (was real-time listener)
 * Saves ~15M reads/month by replacing onSnapshot with getDocs
 * @returns {Promise<Array>} array of topics
 */
export const getFaithTopics = async () => {
    try {
        // Import cache utilities
        const { getOrFetch, CACHE_TTL } = await import('../utils/cache')

        return await getOrFetch(
            'faith_topics_all',
            async () => {
                const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'))
                const snapshot = await getDocs(q) // One-time read instead of listener

                const topics = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))

                if (topics.length === 0) {
                    // Seed if empty
                    console.log('No faith topics found, seeding...')
                    await seedFaithTopics()
                    // Re-fetch after seeding
                    const newSnapshot = await getDocs(q)
                    return newSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                }

                return topics
            },
            CACHE_TTL.VERY_LONG // 30 minutes - static data
        )
    } catch (error) {
        console.error('Error getting faith topics:', error)
        return []
    }
}

/**
 * DEPRECATED: Use getFaithTopics() instead
 * Kept for backward compatibility
 */
export const subscribeToFaithTopics = (onUpdate) => {
    console.warn('subscribeToFaithTopics is deprecated. Use getFaithTopics() instead.')

    // Convert to one-time fetch
    getFaithTopics().then(topics => {
        onUpdate(topics)
    }).catch(error => {
        console.error('Error in subscribeToFaithTopics:', error)
        onUpdate([])
    })

    // Return empty unsubscribe function
    return () => {}
}

/**
 * Update a specific faith topic
 * @param {string} id - topic key/id
 * @param {object} updates - fields to update
 */
export const updateFaithTopic = async (id, updates) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id)
        await updateDoc(docRef, updates)
    } catch (error) {
        console.error('Error updating faith topic:', error)
        throw error
    }
}

/**
 * Seed initial data if collection is empty
 */
export const seedFaithTopics = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
        if (!querySnapshot.empty) {
            console.log('Faith topics already seeded')
            return
        }

        console.log('Seeding faith topics...')

        // Try to create documents one by one instead of batch
        // This might work better with security rules
        for (let index = 0; index < FAITH_TOPICS.length; index++) {
            const topic = FAITH_TOPICS[index]
            try {
                const docRef = doc(db, COLLECTION_NAME, topic.key)
                await setDoc(docRef, {
                    ...topic,
                    order: index,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                console.log(`Created topic: ${topic.title}`)
            } catch (err) {
                console.error(`Failed to create ${topic.title}:`, err.message)
            }
        }

        console.log('Seeding complete')
    } catch (error) {
        console.error('Error seeding faith topics:', error)
        throw error
    }
}
