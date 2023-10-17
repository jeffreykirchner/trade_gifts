#return the plural of a word
def make_plural(word):
    if word.endswith('y'):
        return word[:-1] + 'ies'
    elif word[-1] in ['s', 'x', 'z'] or word[-2:] in ['sh', 'ch']:
        return word + 'es'
    else:
        return word + 's'
