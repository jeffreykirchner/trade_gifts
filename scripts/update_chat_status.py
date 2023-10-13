from main.models import Session
session = Session.objects.get(id=12)
for i in session.session_events.filter(type='chat'):
    i.data['status'] = 'success'
    i.save()